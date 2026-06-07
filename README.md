# Jogo da Velha  
`Um Jogo da Velha, com um modo de jogo contra uma I.A neural!`  
> Projeto sendo construído com *React, TypeScript, Python, Vite e o Capacitor*   

---

<div align="center">
  <img src="https://img.shields.io/badge/Em%20Desenvolvimento-%23C63E3E" alt="Status">
</div>

## 📒 Requisitos
1. Um terminal ou IDE de preferência.  
2. [Node.js](https://nodejs.org/pt) com o npm instalado.  
3. [Python 3.9+](https://www.python.org/downloads/) instalado.  
4. Bibliotecas listadas em:
   - *`jogo-da-velha/package.json`*
   - *`jogo-da-velha/backend/requirements.txt`*
   - *`Ao rodar o python app.py será instalado a I.A localmente.`*
5. Rodar o **Back-End** *`python app.py`* caso queira jogar o modo contra a *I.A neural*.
6. Um computador capaz de rodar I.A localmente de modo estável

## 🖥️ Opções de Download
-  Baixar projeto com git:
  ```bash
   git clone https://github.com/Isaac-Machado-Profissional/jogo-da-velha-react.git
   ```
-  Baixar projeto via link:  
  https://github.com/Isaac-Machado-Profissional/jogo-da-velha-react/archive/refs/heads/main.zip

-  Baixar apk(Apenas modo 2 jogadores):  
  [`jogo-da-velha.apk`](https://github.com/isaacmachado-dev/jogo-da-velha-ai/releases/download/v0.3.0/jogo-da-velha.apk) 

## 🚀 Rodando localmente
Garanta que está na raiz da pasta jogo-da-velha anteriormente baixada.

```markdown
# 1. Rodando o Front-END:
npm install
npm run dev
# > Agora, para rodar o Back-END, garanta abrir uma nova janela no terminal.
```

> Ao rodar o comando abaixo, será baixado a I.A da [PrunaAI](https://www.pruna.ai/) modelo [Falcon RW](https://huggingface.co/PrunaAI/tiiuae-falcon-rw-1b-bnb-8bit-smashed/tree/main) de 1B:
```markdown
# 2. Rodando o Back-END:
cd backend
pip install -r requirements.txt
python main.py
```
