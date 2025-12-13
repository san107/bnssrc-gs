FROM mcr.microsoft.com/devcontainers/rust:1-1-bullseye

RUN curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash
RUN cargo binstall cargo-watch systemfd

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

USER vscode

RUN bash -c "$(curl -fsSL https://raw.githubusercontent.com/ohmybash/oh-my-bash/master/tools/install.sh)"