FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Install zsh, Playwright system dependencies, and Docker CLI
USER root
RUN apt-get update && apt-get install -y \
    zsh \
    libnspr4 \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Docker CLI
RUN install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

# Add node user to docker group for Docker socket access
RUN groupadd -f docker && usermod -aG docker node

USER node
RUN if [ ! -d "/home/node/.oh-my-zsh" ]; then \
        sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended; \
    else \
        echo "oh-my-zsh already installed"; \
    fi

# Configure npm global directory for user and install Claude Code
RUN npm config set prefix ~/.npm-global && \
    echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc && \
    echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc && \
    npm install -g npm@latest @anthropic-ai/claude-code

# Install Playwright separately to avoid dependency conflicts
RUN npm install -g @playwright/test playwright && \
    npx playwright install chromium

# Set up shell history persistence for both bash and zsh
RUN echo 'export HISTFILE=/home/node/.shell_history/.bash_history' >> /home/node/.bashrc && \
    echo 'export HISTSIZE=10000' >> /home/node/.bashrc && \
    echo 'export HISTFILESIZE=10000' >> /home/node/.bashrc && \
    echo 'export HISTFILE=/home/node/.shell_history/.zsh_history' >> /home/node/.zshrc && \
    echo 'export HISTSIZE=10000' >> /home/node/.zshrc && \
    echo 'export SAVEHIST=10000' >> /home/node/.zshrc && \
    mkdir -p /home/node/.shell_history

# Set zsh as default shell
USER root
RUN chsh -s /usr/bin/zsh node

USER node