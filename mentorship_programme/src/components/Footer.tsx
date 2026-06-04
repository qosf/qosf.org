import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="site-footer bg-qosf-blue-dark text-white/70 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <Link href="/" className="text-white font-bold text-lg">
              QOSF Mentorship Programme
            </Link>
            <hr className="my-3 border-white/20" />
            <p className="text-sm">
              The content of this website is released under the{" "}
              <a
                href="https://github.com/qosf/qosf.org/blob/master/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-qosf-accent hover:underline"
              >
                CC0 1.0 Universal
              </a>{" "}
              license.
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/company/qosf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-qosf-accent transition-colors"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedin} size="2x" />
            </a>
            <a
              href="https://www.youtube.com/channel/UCcEdG3UB19AZMxHymhefh1Q"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-qosf-accent transition-colors"
              aria-label="YouTube"
            >
              <FontAwesomeIcon icon={faYoutube} size="2x" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
