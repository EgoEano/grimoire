class WeightedDirectedGraph {
    constructor() {
        this.adjacencyList = {};
    }

    // Creating vertex
    addVertex(vertex) {
        if (!this.adjacencyList[vertex]) {
            this.adjacencyList[vertex] = [];
        }
    }

    // Adding edge with weight between two vertexes
    addEdge(vertex1, vertex2, weight) {
        // In oriented graph we add edge only in one direction
        this.adjacencyList[vertex1].push({ node: vertex2, weight: weight });
    }

    // Print Graph
    printGraph() {
        for (let vertex in this.adjacencyList) {
            let edges = this.adjacencyList[vertex]
                .map(edge => `${edge.node} (weight: ${edge.weight})`)
                .join(", ");
            console.log(`${vertex} -> ${edges}`);
        }
    }
}

// An example
const graph = new WeightedDirectedGraph();

graph.addVertex('A');
graph.addVertex('B');
graph.addVertex('C');
graph.addVertex('D');

graph.addEdge('A', 'B', 5);
graph.addEdge('A', 'C', 3);
graph.addEdge('B', 'D', 7);
graph.addEdge('C', 'D', 4);
graph.addEdge('D', 'A', 2); // Oriented from D to A

graph.printGraph();
