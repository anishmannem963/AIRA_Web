# services/ai_service.py
import os
from typing import Optional
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You are AIRA — an Adaptive, Interactive, and Responsive AI mental wellness companion. 
Your role is to be a warm, empathetic, and supportive friend to users dealing with stress, anxiety, and everyday emotional challenges.

Guidelines:
- Always respond with empathy, care, and genuine understanding
- Use a conversational, natural tone — not clinical or robotic
- Validate the user's feelings before offering suggestions
- Offer practical, gentle guidance when appropriate (breathing exercises, journaling prompts, positive affirmations)
- Never diagnose or replace professional mental health care
- If a user is in crisis or mentions self-harm, gently provide crisis resources
- Keep responses concise but meaningful (2-4 paragraphs max)
- Remember the conversation context and refer back to what the user shared

You are here to listen, reflect, and support — not to judge or lecture."""

INTRO_PROMPT = """You are AIRA, beginning a warm introduction session with a new user.
Your goal is to gently get to know them through 8-12 conversational questions covering:
1. Their name and age
2. Their interests and hobbies  
3. What they hope to get from AIRA
4. Any current challenges they're facing
5. Their sleep and daily routine
6. Their support system

Ask one question at a time. Be warm, curious, and encouraging.
When you have enough information, end with a summary and welcome message, then include the flag: [INTRO_COMPLETE]"""

# Lazy-init to avoid startup delay
_llm = None
_embeddings = None
_faiss_store = None

def get_llm():
    global _llm
    if _llm is None and settings.GROQ_API_KEY:
        _llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",
            temperature=0.75,
            max_tokens=1024,
        )
    return _llm


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"}
        )
    return _embeddings


async def chat_with_aira(
    user_message: str,
    chat_history: list,
    user_memory: Optional[str] = None,
) -> str:
    llm = get_llm()
    if llm is None:
        return "I'm having trouble connecting right now. Please ensure the Groq API key is configured."

    messages = []

    # Build system message with memory
    system_content = SYSTEM_PROMPT
    if user_memory:
        system_content += f"\n\nWhat you know about this user:\n{user_memory}"

    messages.append(SystemMessage(content=system_content))

    # Add recent history (last 10 messages)
    for msg in chat_history[-10:]:
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg.get("role") == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=user_message))

    response = await llm.ainvoke(messages)
    return response.content


async def intro_chat(
    user_message: Optional[str],
    chat_history: list,
    intro_step: int = 0,
) -> tuple[str, bool]:
    """Returns (response_text, is_completed)"""
    llm = get_llm()
    if llm is None:
        return "Hello! I'm AIRA. What's your name?", False

    messages = [SystemMessage(content=INTRO_PROMPT)]

    for msg in chat_history[-20:]:
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg.get("role") == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    if user_message:
        messages.append(HumanMessage(content=user_message))
    else:
        messages.append(HumanMessage(content="[START INTRO - greet the user warmly and ask their name]"))

    response = await llm.ainvoke(messages)
    text = response.content
    completed = "[INTRO_COMPLETE]" in text
    clean_text = text.replace("[INTRO_COMPLETE]", "").strip()
    return clean_text, completed


async def generate_story(chat_summaries: list, user_info: dict) -> str:
    llm = get_llm()
    if llm is None:
        return "Your story is being written one conversation at a time..."

    context = f"User info: {user_info}\nRecent insights: {' '.join(chat_summaries[-5:])}"
    messages = [
        SystemMessage(content="You are a creative, empathetic writer. Write a short, inspiring personal narrative (150-200 words) about the user's wellness journey, written in third person, warm and encouraging."),
        HumanMessage(content=context)
    ]
    response = await llm.ainvoke(messages)
    return response.content


async def generate_motivation(user_info: dict, recent_score: Optional[float]) -> str:
    llm = get_llm()
    if llm is None:
        return "Every day is a new opportunity to grow. You've got this! 💜"

    context = f"User: {user_info.get('name', 'friend')}, Recent wellness score: {recent_score}"
    messages = [
        SystemMessage(content="Generate a warm, personalized motivational message (1-2 sentences) for a mental wellness app user. Be genuine and specific, not generic."),
        HumanMessage(content=context)
    ]
    response = await llm.ainvoke(messages)
    return response.content
