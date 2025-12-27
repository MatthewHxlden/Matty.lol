-- Add admin role to the specified user
INSERT INTO public.user_roles (user_id, role)
VALUES ('d547803b-1874-40e0-81fb-3b9d03ddf503', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert sample blog posts
INSERT INTO public.blog_posts (author_id, title, slug, excerpt, content, tags, published, read_time)
VALUES 
  ('d547803b-1874-40e0-81fb-3b9d03ddf503', 'Breaking Into the Matrix: A Beginner''s Guide', 'breaking-into-matrix', 'An introduction to cybersecurity fundamentals for those ready to dive into the digital underworld.', '# Breaking Into the Matrix

The neon lights flicker as you boot up your terminal. Welcome to the world of cybersecurity.

## Getting Started

Every netrunner needs to understand the basics before diving deep into the code streams...

## Essential Tools

- **Nmap** - Your digital sonar
- **Wireshark** - See the data flow
- **Metasploit** - When you need to go offensive

Stay frosty, choomba.', ARRAY['cybersecurity', 'tutorial', 'beginners'], true, '5 min'),
  
  ('d547803b-1874-40e0-81fb-3b9d03ddf503', 'Neural Networks: The Future of AI', 'neural-networks-future-ai', 'Exploring how artificial neural networks are reshaping our digital landscape.', '# Neural Networks: The Future of AI

The chrome gleams under fluorescent lights as another AI comes online...

## What Are Neural Networks?

At their core, neural networks mimic the human brain''s architecture.

## Applications

1. Image recognition
2. Natural language processing
3. Autonomous systems

The future is already here.', ARRAY['AI', 'machine-learning', 'technology'], true, '7 min'),
  
  ('d547803b-1874-40e0-81fb-3b9d03ddf503', 'Decentralized Dreams: Web3 and Beyond', 'decentralized-dreams-web3', 'A deep dive into blockchain technology and the promise of a decentralized internet.', '# Decentralized Dreams

The old web is dying. Something new is being born in the data streams...

## The Promise of Decentralization

No more megacorps controlling your data. No more centralized points of failure.

## Key Technologies

- Smart contracts
- DAOs
- Zero-knowledge proofs

The revolution will be decentralized.', ARRAY['web3', 'blockchain', 'decentralization'], true, '8 min');