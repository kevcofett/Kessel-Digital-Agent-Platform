"""
Text Transforms
Transformations for text data
"""

import logging
import re
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from .base import Transform, ColumnTransform

logger = logging.getLogger(__name__)


class TextCleaner(ColumnTransform):
    """
    Clean and normalize text data.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        lowercase: bool = True,
        remove_punctuation: bool = True,
        remove_numbers: bool = False,
        remove_whitespace: bool = True,
        remove_stopwords: bool = False,
        stopwords: Optional[List[str]] = None,
        min_length: int = 0,
    ):
        super().__init__("text_cleaner", columns, suffix="cleaned")
        self.lowercase = lowercase
        self.remove_punctuation = remove_punctuation
        self.remove_numbers = remove_numbers
        self.remove_whitespace = remove_whitespace
        self.remove_stopwords = remove_stopwords
        self.stopwords = set(stopwords) if stopwords else self._default_stopwords()
        self.min_length = min_length

    def _default_stopwords(self) -> set:
        """Default English stopwords."""
        return {
            'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else',
            'when', 'at', 'from', 'by', 'on', 'off', 'for', 'in', 'out',
            'over', 'to', 'into', 'with', 'is', 'are', 'was', 'were',
            'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
            'did', 'will', 'would', 'could', 'should', 'may', 'might',
            'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
            'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
            'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him',
            'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its',
            'itself', 'they', 'them', 'their', 'theirs', 'themselves',
            'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
        }

    def fit(self, data: pd.DataFrame) -> 'TextCleaner':
        """Text cleaning is stateless."""
        self._fit_params = {'columns': self._get_columns(data)}
        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply text cleaning."""
        result = data.copy()

        for col in self._fit_params['columns']:
            if col not in result.columns:
                continue

            output_col = self._output_column_name(col)
            result[output_col] = result[col].apply(self._clean_text)

        return result

    def _clean_text(self, text: Any) -> str:
        """Clean a single text value."""
        if pd.isna(text):
            return ""

        text = str(text)

        if self.lowercase:
            text = text.lower()

        if self.remove_punctuation:
            text = re.sub(r'[^\w\s]', ' ', text)

        if self.remove_numbers:
            text = re.sub(r'\d+', '', text)

        if self.remove_whitespace:
            text = ' '.join(text.split())

        if self.remove_stopwords:
            words = text.split()
            words = [w for w in words if w not in self.stopwords]
            text = ' '.join(words)

        if self.min_length > 0:
            words = text.split()
            words = [w for w in words if len(w) >= self.min_length]
            text = ' '.join(words)

        return text


class TextVectorizer(Transform):
    """
    Vectorize text using TF-IDF or count vectorization.
    """

    def __init__(
        self,
        column: str,
        method: str = 'tfidf',
        max_features: int = 1000,
        ngram_range: tuple = (1, 1),
        min_df: int = 1,
        max_df: float = 1.0,
        prefix: Optional[str] = None,
    ):
        super().__init__("text_vectorizer", [column])
        self.column = column
        self.method = method
        self.max_features = max_features
        self.ngram_range = ngram_range
        self.min_df = min_df
        self.max_df = max_df
        self.prefix = prefix or column
        self._vectorizer = None

    def fit(self, data: pd.DataFrame) -> 'TextVectorizer':
        """Fit vectorizer on text data."""
        if self.column not in data.columns:
            raise ValueError(f"Column '{self.column}' not found")

        from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer

        if self.method == 'tfidf':
            self._vectorizer = TfidfVectorizer(
                max_features=self.max_features,
                ngram_range=self.ngram_range,
                min_df=self.min_df,
                max_df=self.max_df,
            )
        else:
            self._vectorizer = CountVectorizer(
                max_features=self.max_features,
                ngram_range=self.ngram_range,
                min_df=self.min_df,
                max_df=self.max_df,
            )

        # Fill NaN with empty string
        texts = data[self.column].fillna('').astype(str)
        self._vectorizer.fit(texts)

        self._fit_params = {
            'vocabulary': self._vectorizer.vocabulary_,
            'feature_names': self._vectorizer.get_feature_names_out().tolist(),
        }
        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply text vectorization."""
        if not self._fitted:
            raise ValueError("Transform not fitted. Call fit() first.")

        if self.column not in data.columns:
            raise ValueError(f"Column '{self.column}' not found")

        texts = data[self.column].fillna('').astype(str)
        vectors = self._vectorizer.transform(texts)

        # Convert sparse matrix to DataFrame
        feature_names = [f"{self.prefix}_{name}" for name in self._fit_params['feature_names']]
        vector_df = pd.DataFrame(
            vectors.toarray(),
            columns=feature_names,
            index=data.index,
        )

        result = pd.concat([data, vector_df], axis=1)
        return result

    def get_feature_names(self) -> List[str]:
        """Get names of output features."""
        if not self._fitted:
            return []
        return [f"{self.prefix}_{name}" for name in self._fit_params['feature_names']]


class TextStats(ColumnTransform):
    """
    Extract statistical features from text.
    """

    def __init__(
        self,
        columns: Optional[List[str]] = None,
        features: Optional[List[str]] = None,
    ):
        super().__init__("text_stats", columns)
        self.features = features or [
            'char_count', 'word_count', 'sentence_count',
            'avg_word_length', 'unique_word_ratio',
        ]

    def fit(self, data: pd.DataFrame) -> 'TextStats':
        """Text stats are stateless."""
        self._fit_params = {'columns': self._get_columns(data)}
        self._fitted = True
        return self

    def transform(self, data: pd.DataFrame) -> pd.DataFrame:
        """Extract text statistics."""
        result = data.copy()

        for col in self._fit_params['columns']:
            if col not in result.columns:
                continue

            texts = result[col].fillna('').astype(str)

            if 'char_count' in self.features:
                result[f"{col}_char_count"] = texts.str.len()

            if 'word_count' in self.features:
                result[f"{col}_word_count"] = texts.str.split().str.len()

            if 'sentence_count' in self.features:
                result[f"{col}_sentence_count"] = texts.str.count(r'[.!?]+')

            if 'avg_word_length' in self.features:
                word_lengths = texts.apply(
                    lambda x: np.mean([len(w) for w in x.split()]) if x.split() else 0
                )
                result[f"{col}_avg_word_length"] = word_lengths

            if 'unique_word_ratio' in self.features:
                def unique_ratio(text):
                    words = text.lower().split()
                    if not words:
                        return 0
                    return len(set(words)) / len(words)

                result[f"{col}_unique_word_ratio"] = texts.apply(unique_ratio)

            if 'uppercase_ratio' in self.features:
                result[f"{col}_uppercase_ratio"] = texts.apply(
                    lambda x: sum(1 for c in x if c.isupper()) / max(len(x), 1)
                )

            if 'digit_ratio' in self.features:
                result[f"{col}_digit_ratio"] = texts.apply(
                    lambda x: sum(1 for c in x if c.isdigit()) / max(len(x), 1)
                )

        return result
