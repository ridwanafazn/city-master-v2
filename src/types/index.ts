// src/types/index.ts

/**
 * Type definitions untuk Fitness-RS Engine.
 * Interface ini memetakan (mirror) skema Pydantic di Backend (FastAPI)
 * untuk memastikan Type Safety dari ujung ke ujung (End-to-End).
 */

// ─────────────────────────────────────────────────────────────────
// 1. Core Models (Sesuai dengan struktur dataset CSV/ExerciseOut)
// ─────────────────────────────────────────────────────────────────
export interface Exercise {
  exercise_id: string | number;
  exercise_name: string;
  body_part: string;
  equipment: string[];
  primary_muscle: string[];
  secondary_muscle: string[];
  exercise_image: string;
  exercise_type?: string;
}

// ─────────────────────────────────────────────────────────────────
// 2. Weekly Schedule Feature (RecommendationRequest & Response)
// ─────────────────────────────────────────────────────────────────
export interface RecommendationRequest {
  gender: 'male' | 'female'; // Strict literal typing
  height_cm: number;
  weight_kg: number;
  injuries: string[];
  available_days: number;
  preferred_body_part: string[];
  preferred_equipment: string[];
}

export interface RecommendationDay {
  day: number;
  day_focus: string;
  exercises: Exercise[];
}

export interface RecommendationResponse {
  bmi: number;
  bmi_category: string;
  split_type: string;
  schedule: Record<string, string>; // Maps ke Dict[str, str] di Pydantic
  days: RecommendationDay[];
}

// ─────────────────────────────────────────────────────────────────
// 3. Single Focus Feature (ByFocusRequest & Response)
// ─────────────────────────────────────────────────────────────────
export interface ByFocusRequest {
  day_focus: string;
  injuries?: string[];
  preferred_equipment?: string[];
  preferred_body_part?: string[];
  bmi?: number | null; // Sesuai dengan Optional[float] di Pydantic
}

export interface ByFocusResponse {
  day_focus: string;
  exercises: Exercise[];
}