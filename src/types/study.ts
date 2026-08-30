export type StudySet = 
{
    id: string;
    title: string;
};

export type StudyMaterial=
{
    id: string;
    file_name: string;
    storage_path: string;
    mime_type: string;
    explanation: string | null;
};
export type Flashcard = 
{
    id: string;
    study_material_id: string;
    question: string;
    answer: string;
    position: number;
};
export type QuizQuestion = 
{
    id: string;
    study_material_id: string;
    question: string;
    options: string[];
    correct_option: number;
    position: number;
};