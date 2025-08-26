export async function getAiMove(board: (string | null)[]) {
    
    const res = await fetch("http://localhost:5000/ai-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board })
    });

    const data = await res.json();
    return data.move;
}
