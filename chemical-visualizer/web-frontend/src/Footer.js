export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                {/* Brand */}
                <div className="footer-brand">
                    <span className="footer-logo">🧪</span>
                    <span className="footer-title">Chemical Visualizer</span>
                </div>

                {/* Links */}
                <nav className="footer-links">
                    <a href="#about">About</a>
                    <span className="link-separator">•</span>
                    <a href="#docs">Documentation</a>
                    <span className="link-separator">•</span>
                    <a href="#privacy">Privacy</a>
                    <span className="link-separator">•</span>
                    <a href="#terms">Terms</a>
                </nav>

                {/* Contact */}
                <div className="footer-contact">
                    <span>📧 contact@chemviz.com</span>
                    <span className="contact-separator">|</span>
                    <span>📞 +1 (555) 123-4567</span>
                </div>

                {/* Copyright */}
                <div className="footer-copyright">
                    © 2025 Chemical Equipment Parameter Visualizer. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
