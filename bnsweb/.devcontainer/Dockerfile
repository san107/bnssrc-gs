FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

RUN apt update  \
    && apt install -y \
    fd-find \
    fish \ 
    fzf \
    iputils-ping \
    neovim \
    ripgrep \
    ugrep \
    && apt clean \
    && rm -rf /var/lib/apt/lists/* 

# RUN apt update \
#     && apt install -y \
#     fd-find \
#     neovim \
#     ripgrep

#COPY .bashrc /home/vscode/

#    && apt clean \
#    && rm -rf /var/lib/apt/lists/* 

USER node

RUN bash -c "$(curl -fsSL https://raw.githubusercontent.com/ohmybash/oh-my-bash/master/tools/install.sh)"