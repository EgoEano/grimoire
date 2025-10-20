class WeightedDirectedGraphMatrix {
    constructor(size) {
        this.matrix = Array.from({ length: size }, () => Array(size).fill(0));
        this.size = size;
    }

    // Create an oriened edge with weight
    addEdge(vertex1, vertex2, weight) {
        this.matrix[vertex1][vertex2] = weight;
    }

    // Increasing size of matrix for new node
    addVertex() {
        this.size++;
        // Create new matrix of a larger size
        const newMatrix = Array.from({ length: this.size }, () => Array(this.size).fill(0));
        // Copying date form old matrix
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                newMatrix[i][j] = this.matrix[i][j];
            }
        }
        this.matrix = newMatrix;
    }

    // Print matrix
    printMatrix() {
        console.log("Матрица смежности:");
        for (let row of this.matrix) {
            console.log(row.join(" "));
        }
    }
}

// An example
const graph = new WeightedDirectedGraphMatrix(3);

graph.addEdge(0, 1, 5);
graph.addEdge(1, 2, 7);

graph.addVertex();
graph.addEdge(2, 3, 9);

graph.printMatrix();
