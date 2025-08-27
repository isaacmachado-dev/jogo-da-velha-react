from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import re
import random

app = Flask(__name__)
CORS(app) 

generator = pipeline(
    "text-generation",
    model="tiiuae/falcon-rw-1b",
    device_map="auto"
)

def get_ai_move(board):
    prompt = (
    "Instruction:\n"
    "You are playing as 'O' in a tic-tac-toe game.\n"
    f"Board: {' '.join([v if v else '-' for v in board])}\n"
    "Follow these rules strictly:\n"
    "1. Respond ONLY with a single number from 0 to 8 (the index of your move).\n"
    "2. First, if you can win this turn, choose that move.\n"
    "3. If you cannot win, block the opponent ('X') from winning next turn.\n"
    "4. If neither is possible, choose the best strategic position in this order: center (4), corners (0, 2, 6, 8), sides (1, 3, 5, 7).\n"
    "5. Never output anything except the chosen number.\n"
)

    response = generator(
        prompt,
        max_new_tokens=3,
        return_full_text=False,
        do_sample=False
    )[0]["generated_text"].strip()

    print("Resposta bruta da IA:", repr(response))  

    match = re.search(r"[0-8]", response)
    move = int(match.group()) if match else -1

  
    if move not in range(9) or board[move] is not None:
        livres = [i for i, v in enumerate(board) if v is None]
        move = random.choice(livres) if livres else -1

    return move

@app.route("/ai-move", methods=["POST"])
def ai_move():
    data = request.get_json()
    board = data.get("board")

    if not board or len(board) != 9:
        return jsonify({"error": "Tabuleiro inválido"}), 400

    move = get_ai_move(board)
    return jsonify({"move": move})

if __name__ == "__main__":
    app.run(debug=True)
