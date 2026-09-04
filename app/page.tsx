import Link from "next/link";
import {
  ArrowRight,
  Eye,
  Focus,
  RadioTower,
  Sparkles,
} from "lucide-react";
import { BrandMark, PlatformMark } from "@/components/polaris-brand";
import { HomeLivePreview } from "@/components/home-live-preview";
import { platformKeys } from "@/lib/polaris-demo";

export default function HomePage() {
  return (
    <main className="public-shell">
      <header className="public-header">
        <Link className="brand-link" href="/" aria-label="Polaris Chat home">
          <BrandMark size={34} />
          <span>Polaris Chat</span>
        </Link>
        <nav aria-label="Public navigation">
          <a href="#experience">Experience</a>
          <Link href="/app/platforms">Platforms</Link>
          <Link className="button button-quiet" href="/app/chat">Launch preview</Link>
        </nav>
      </header>

      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <p className="challenge-badge"><Sparkles size={14} aria-hidden="true" /> OpenAI WebMCP Challenge Demo</p>
          <p className="eyebrow">Polaris Chat · Public Preview</p>
          <h1 id="hero-heading">Every community.<br /><span>One North Star.</span></h1>
          <p className="hero-support">
            Follow live conversation and community activity across Twitch, YouTube, Kick,
            TikTok LIVE, and X Live from one calm creator workspace.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/app/chat">
              Launch Interactive Preview <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button button-secondary" href="/app/platforms">
              Explore Platform Hub
            </Link>
          </div>
          <div className="preview-disclosure" role="note">
            <span aria-hidden="true" />
            <p><strong>Interactive Preview</strong>Polaris Chat is in development. Every message, event, identity, metric, and connection state in this experience is simulated.</p>
          </div>
        </div>

        <HomeLivePreview />
      </section>

      <section className="platform-ribbon" aria-label="Preview platforms">
        <p>Five first-class livestream targets</p>
        <div>{platformKeys.map((platform) => <PlatformMark key={platform} platform={platform} />)}</div>
        <span>Preview data only · Live connections coming soon</span>
      </section>

      <section className="experience-section" id="experience" aria-labelledby="experience-heading">
        <div className="section-intro">
          <p className="eyebrow">A quiet producer beside the creator</p>
          <h2 id="experience-heading">Catch what matters without giving up control.</h2>
          <p>
            WebMCP lets ChatGPT inspect the same visible preview workspace, organize existing moments,
            and focus the creator on what deserves attention. It never speaks for the creator.
          </p>
        </div>
        <div className="experience-grid">
          <article>
            <RadioTower size={21} aria-hidden="true" />
            <h3>One live picture</h3>
            <p>Conversation, community moments, and technical signals stay unified without losing their source.</p>
          </article>
          <article>
            <Focus size={21} aria-hidden="true" />
            <h3>One shared queue</h3>
            <p>The creator and agent work from the same visible Producer Queue. Nothing important is hidden off-screen.</p>
          </article>
          <article>
            <Eye size={21} aria-hidden="true" />
            <h3>Human stays in control</h3>
            <p>Every change is local, reviewable, and reversible. No replies, moderation, OAuth, or provider actions.</p>
          </article>
        </div>
      </section>

      <section className="demo-callout" aria-labelledby="demo-heading">
        <div>
          <p className="eyebrow">Ready when Chat gets loud</p>
          <h2 id="demo-heading">Run the Producer Rush scenario.</h2>
          <p>Review a busy five-platform moment, build the queue with ChatGPT, or ask: “Did I miss any Blueprints in today’s stream?”</p>
        </div>
        <Link className="button button-primary" href="/app/chat">Open the workspace <ArrowRight size={17} /></Link>
      </section>

      <footer className="public-footer">
        <Link className="brand-link" href="/"><BrandMark size={28} /><span>Polaris Chat</span></Link>
        <p>Every community. One North Star.</p>
        <span>Public Preview · Simulated data only</span>
      </footer>
    </main>
  );
}
