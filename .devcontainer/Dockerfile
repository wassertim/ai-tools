FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Install zsh and oh-my-zsh
USER root
RUN apt-get update && apt-get install -y zsh && rm -rf /var/lib/apt/lists/*

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