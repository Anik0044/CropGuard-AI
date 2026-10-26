import { ExternalLink } from 'lucide-react';

/**
 * Parses message text and renders clickable, secure links for any detected URLs.
 */
export const formatMessageWithLinks = (text) => {
    if (!text) return null;

    // Regex to match URLs starting with http://, https://, or www.
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (part && part.match(urlRegex)) {
            const href = part.startsWith('http') ? part : `https://${part}`;
            return (
                <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-emerald-300 hover:text-white transition-colors inline-flex items-center gap-0.5 font-medium break-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                    <ExternalLink size={12} className="inline-block flex-shrink-0" />
                </a>
            );
        }
        return part;
    });
};
