"""
Configuration settings for the Narad application.
Centralized configuration management for better maintainability.
"""

import os
from typing import Optional
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application configuration settings."""
    
    # LLM Configuration
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    llm_model: str = Field("gpt-3.5-turbo", env="LLM_MODEL")
    llm_temperature: float = Field(0.7, env="LLM_TEMPERATURE")
    
    # Memory Configuration
    memory_file_path: str = Field("data/narad_memory.json", env="MEMORY_FILE_PATH")
    max_memory_interactions: int = Field(50, env="MAX_MEMORY_INTERACTIONS")
    
    # Application Configuration
    app_name: str = "Narad AI Client Follow-up Agent"
    version: str = "1.0.0"
    debug: bool = Field(False, env="DEBUG")
    
    # Database Configuration (for future phases)
    database_url: Optional[str] = Field(None, env="DATABASE_URL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
