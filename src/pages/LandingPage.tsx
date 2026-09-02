import { Link } from "react-router";
import "./LandingPage.css";

function LandingPage()
{
    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="landing-nav">

                    <Link className="landing-brand" to="/">StudyBuddy</Link>
                    <div className="landing-nav-actions">

                        <Link className="landing-nav-login" to="/login">
                            Log in
                        </Link>

                        <Link className="landing-nav-primary" to="/register">
                            Get started
                        </Link>

                    </div>
                </div>
            </header>


            <main>
                <section className="landing-hero">

                    <div className="landing-hero-content">
                        <p className="landing-eyebrow">
                            Your smarter study companion
                        </p>

                        <h1>Turn your study materials into better study sessions.</h1>

                        <p className="landing-hero-description">
                            Upload your notes and turn them into clear explanations, 
                            flashcards, and quizzes designed to help you study more effectively.
                        </p>

                        <div className="landing-hero-actions">
                            <Link className="landing-primary-action" to="/register">
                                Get started
                            </Link>

                            <Link className="landing-secondary-action" to="/login">
                                Log in
                            </Link>

                        </div>
                    </div>
                </section>

                <div className="landing-feature-preview">

                    <div className="landing-feature-item">
                        <h3>Explain</h3>
                        <p>Understand difficult material in simpler words.</p>
                    </div>

                    <div className="landing-feature-item">
                        <h3>Flashcards</h3>
                        <p>Review the concepts that matter most.</p>
                    </div>

                    <div className="landing-feature-item">
                        <h3>Quiz</h3>
                        <p>Test what you know with focused questions.</p>
                    </div>
                </div>

                <section className="landing-how">
                    <div className="landing-how-header">
                        <p className="landing-eyebrow">How it works</p>
                        <h2>From your notes to a study session in three steps.</h2>
                    </div>

                    <div className="landing-how-grid">

                        <div className="landing-how-step">
                            <span>01</span>
                            <h3>Upload your material</h3>
                            <p>Add your course notes or PDF to a study set.</p>
                        </div>

                        <div className="landing-how-step">
                            <span>02</span>
                            <h3>Choose how to study</h3>
                            <p>Use explanations, flashcards, or quizzes depending on what you need.</p>
                        </div>

                        <div className="landing-how-step">
                            <span>03</span>
                            <h3>Start studying</h3>
                            <p>Review key concepts, test yourself, and keep everything organized in one place.</p>
                        </div>

                    </div>
                </section>


                <section className="landing-showcase">

                    <div className="landing-showcase-content">
                        <p className="landing-eyebrow">Built for real study sessions</p>

                        <h2>Everything you need, without leaving your study set.</h2>

                        <p>
                            Upload your material once, then switch between explanations,
                            flashcards, and quizzes whenever you need a different way to study.
                        </p>

                        <div className="landing-showcase-points">
                            <p>✓ Simplify difficult material</p>
                            <p>✓ Review with focused flashcards</p>
                            <p>✓ Test yourself with quizzes</p>
                        </div>
                    </div>

                    <div className="landing-showcase-preview">
                        <div className="showcase-window">

                            <div className="showcase-window-header">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <div className="showcase-window-content">
                                <p className="showcase-file-name">Operating Systems</p>

                                <div className="showcase-tabs">
                                    <span>Explanation</span>
                                    <span>Flashcards</span>
                                    <span>Quiz</span>
                                </div>

                                <div className="showcase-demo">
                                    <p className="showcase-label">EXPLANATION</p>
                                    <h3>Virtual Memory</h3>
                                    <p>
                                        Virtual memory allows a process to use more memory
                                        than is currently available in physical RAM...
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                <section className="landing-cta">
                    <div className="landing-cta-content">
                        <h2>Ready to make studying simpler?</h2>
                        <p>
                            Create your first study set and turn your material into a study session.
                        </p>

                        <Link className="landing-primary-action" to="/register">
                            Get started
                        </Link>
                    </div>
                </section>

                <footer className="landing-footer">
                    <div className="landing-footer-content">
                        <Link className="landing-brand" to="/">
                            StudyBuddy
                        </Link>

                        <p>© 2026 StudyBuddy</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}

export default LandingPage;

/*
This is StudyBuddy’s public starting page. At the moment it provides navigation to Login and Register. 
Later it will become the proper landing page that introduces StudyBuddy and explains its main features to users.
*/