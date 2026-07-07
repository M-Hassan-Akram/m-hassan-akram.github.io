// Enhanced Chatbot with Portfolio Context
const PORTFOLIO_DATA = {
  name: "Muhammad Hassan Akram",
  email: "mhassanakram698@gmail.com",
  phone: "+923007858987",
  location: "Faisalabad, Pakistan",
  education: {
    degree: "B.Sc (Hons) Food Science & Technology",
    university: "University of Agriculture Faisalabad (UAF)",
    cgpa: "3.60",
    semester: "6th Semester",
    year: "2023-2027"
  },
  certifications: "41+ verified certificates, Meta Certified Digital Marketing Associate",
  experience: [
    {
      role: "Digital Marketing Expert",
      company: "YPDC-UAF (Young Peace & Development Corp)",
      period: "May 2024 - Sep 2024",
      description: "Managed social media and digital campaigns"
    },
    {
      role: "Head Teacher / Principal",
      company: "Al Falah Grammar High School, Talhar",
      period: "Aug 2022 - Sep 2023"
    },
    {
      role: "Content Creator & YouTube Channel Manager",
      company: "Sani Sports Official & Pakistan Cricket Channel",
      description: "Managed cricket YouTube channel with strong subscriber base"
    }
  ],
  skills: ["Food Science", "Digital Marketing", "AI & Technology", "SEO", "Content Creation", "Data Analysis"],
  interests: ["Badminton", "Cricket", "AI", "Food Security", "Community Education"],
  socialLinks: {
    linkedin: "https://linkedin.com/in/m-hassan-007i"
  }
};

class ChatBot {
  constructor() {
    this.chatMessages = [];
    this.isLoading = false;
    this.apiKey = this.getApiKey();
    this.initializeEventListeners();
  }

  getApiKey() {
    // Get from environment variable or local storage
    return localStorage.getItem('GEMINI_API_KEY') || '';
  }

  initializeEventListeners() {
    const chatBtn = document.getElementById('chatBtn');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = chatWindow?.querySelector('.chat-close');
    const chatSend = chatWindow?.querySelector('.chat-send');
    const chatInput = chatWindow?.querySelector('.chat-input');

    chatBtn?.addEventListener('click', () => this.toggleChat());
    chatClose?.addEventListener('click', () => this.toggleChat());
    chatSend?.addEventListener('click', () => this.sendMessage());
    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow?.classList.toggle('open');
  }

  async sendMessage() {
    const chatInput = document.querySelector('.chat-input');
    const message = chatInput?.value.trim();

    if (!message) return;

    // Add user message to chat
    this.addMessage(message, 'user');
    chatInput.value = '';

    // Show typing indicator
    this.showTyping();

    try {
      const response = await this.getResponse(message);
      this.removeTyping();
      this.addMessage(response, 'bot');
    } catch (error) {
      console.error('Chat error:', error);
      this.removeTyping();
      const fallbackResponse = this.generatePortfolioResponse(message);
      this.addMessage(fallbackResponse, 'bot');
    }
  }

  async getResponse(userMessage) {
    // First, try to match with portfolio data
    const portfolioResponse = this.matchPortfolioData(userMessage);
    if (portfolioResponse) {
      return portfolioResponse;
    }

    // If no match, try Gemini API (if key is available)
    if (this.apiKey) {
      return await this.callGeminiAPI(userMessage);
    }

    // Fallback response
    return this.generateFallbackResponse(userMessage);
  }

  matchPortfolioData(message) {
    const msg = message.toLowerCase();

    // About Hassan
    if (msg.includes('who') || msg.includes('about') || msg.includes('introduce')) {
      return `I'm ${PORTFOLIO_DATA.name}, a ${PORTFOLIO_DATA.education.degree} student at ${PORTFOLIO_DATA.education.university}. I'm passionate about AI, digital marketing, and food security. Currently maintaining a CGPA of ${PORTFOLIO_DATA.education.cgpa}. Feel free to ask me about my experience, skills, or projects!`;
    }

    // Contact information
    if (msg.includes('contact') || msg.includes('email') || msg.includes('phone')) {
      return `You can reach me at:\n📧 Email: ${PORTFOLIO_DATA.email}\n📱 Phone: ${PORTFOLIO_DATA.phone}\n📍 Location: ${PORTFOLIO_DATA.location}\n💼 LinkedIn: ${PORTFOLIO_DATA.socialLinks.linkedin}`;
    }

    // Education
    if (msg.includes('education') || msg.includes('degree') || msg.includes('university')) {
      return `I'm currently pursuing ${PORTFOLIO_DATA.education.degree} from ${PORTFOLIO_DATA.education.university}. I'm in my ${PORTFOLIO_DATA.education.semester} semester (Expected graduation: ${PORTFOLIO_DATA.education.year}) with a CGPA of ${PORTFOLIO_DATA.education.cgpa}.`;
    }

    // Experience
    if (msg.includes('experience') || msg.includes('work') || msg.includes('job')) {
      let exp = "My professional experience includes:\n";
      PORTFOLIO_DATA.experience.forEach(job => {
        exp += `\n• **${job.role}** at ${job.company}\n  (${job.period})\n  ${job.description}\n`;
      });
      return exp;
    }

    // Skills
    if (msg.includes('skills') || msg.includes('expertise')) {
      return `My key skills include:\n${PORTFOLIO_DATA.skills.map(s => `• ${s}`).join('\n')}\n\nI'm also skilled in Excel, Data Analysis, and various digital marketing tools.`;
    }

    // Certifications
    if (msg.includes('certificate') || msg.includes('meta') || msg.includes('certified')) {
      return `I have ${PORTFOLIO_DATA.certifications}. I'm continuously learning and updating my skills in AI, marketing, and food technology.`;
    }

    // Interests/Sports
    if (msg.includes('interest') || msg.includes('hobby') || msg.includes('sport') || msg.includes('badminton') || msg.includes('cricket')) {
      return `I'm passionate about ${PORTFOLIO_DATA.interests.join(', ')}. I've participated in badminton and cricket at the Tehsil level. Sports help me stay focused and disciplined, which I apply to my professional work as well!`;
    }

    // Projects/Industrial Visits
    if (msg.includes('project') || msg.includes('visit') || msg.includes('industrial')) {
      return "As a Food Science student, I've participated in several industrial visits to leading food and beverage manufacturers. These experiences gave me practical knowledge of production processes, HACCP, food safety, and QA protocols. Ask me about specific industries you're interested in!";
    }

    return null;
  }

  async callGeminiAPI(userMessage) {
    const context = `You are an AI assistant for Hassan Akram's portfolio. Hassan is a Food Science student at UAF with a CGPA of 3.60, Meta Certified Digital Marketing Associate with 41+ certificates. He has 3+ years of experience in digital marketing and content creation. When answering questions, reference his portfolio information when relevant. Portfolio: ${JSON.stringify(PORTFOLIO_DATA)}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${context}\n\nUser question: ${userMessage}`
            }
          ]
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  generatePortfolioResponse(message) {
    const responses = [
      `I couldn't find specific information about "${message}" in my portfolio. However, you can learn more about my:\n• Experience\n• Education\n• Skills\n• Certifications\n• Projects\n\nOr contact me directly at ${PORTFOLIO_DATA.email}`,
      `That's a great question! You might want to know about my work in digital marketing, food science, or check out my projects. What specific aspect interests you?`,
      `I'm happy to help! Feel free to ask me about my background, experience, or anything you see on my portfolio. You can also reach me at ${PORTFOLIO_DATA.email}`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  generateFallbackResponse(message) {
    return `I'm currently offline for AI responses, but I'm happy to help!\n\nPlease feel free to ask about:\n• My background and experience\n• My skills and certifications\n• My projects and industrial visits\n• How to contact me\n\nOr reach out directly: ${PORTFOLIO_DATA.email}`;
  }

  addMessage(text, sender) {
    const chatMsgs = document.querySelector('.chat-msgs');
    if (!chatMsgs) return;

    const messageEl = document.createElement('div');
    messageEl.className = `msg ${sender}`;
    messageEl.innerHTML = text;
    chatMsgs.appendChild(messageEl);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    this.chatMessages.push({ text, sender, timestamp: new Date() });
  }

  showTyping() {
    const chatMsgs = document.querySelector('.chat-msgs');
    if (!chatMsgs) return;

    const typingEl = document.createElement('div');
    typingEl.className = 'msg bot typing-dots';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    typingEl.id = 'typing-indicator';
    chatMsgs.appendChild(typingEl);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  removeTyping() {
    const typingEl = document.getElementById('typing-indicator');
    typingEl?.remove();
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ChatBot();
});
