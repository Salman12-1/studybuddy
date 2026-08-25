import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI(); //OpenAI() automatically checks for OPENAI_API_KEY in the enviroment.

export default openai;//means other backend files can reuse the same client