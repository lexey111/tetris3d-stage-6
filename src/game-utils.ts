function traverseBottomTop(field, callback: (row, col) => void) {
    for (let row = 0; row < field.length; row++) {
        for (let col = 0; col < field[row].length; col++) {
            callback(row, col);
        }
    }
}

function makeAllSolids(field) {
    traverseBottomTop(field, (row, col) => {
        if (field[row][col] === 1) {
            field[row][col] = 2;
        }
    });
}

export function fallDown(field) {
    let finished = false;
    let stopRow = -1;
    let hasToRemove = false;

    traverseBottomTop(field, (row, col) => {
        const block = field[row][col];

        if (block !== 1) {
            return;
        }

        if (row === 0) {
            finished = true;
            stopRow = row;
            makeAllSolids(field);
            return;
        }

        const blockBelow = row > 0 ? field[row - 1][col] : 0;
        if (block === 1 && (blockBelow && blockBelow !== 1)) {
            finished = true;
            stopRow = row;
            makeAllSolids(field);
        }
    });

    if (!finished) {
        traverseBottomTop(field, (row, col) => {
            const block = field[row][col];

            if (block !== 1) {
                // empty cell or solid block
                return;
            }
            // move it down!
            field[row - 1][col] = 1;
            field[row][col] = 0;
        });
    }

    for (let rowIdx = 0; rowIdx < 20; rowIdx++) {
        const line = field[rowIdx];
        const filled = line.filter(cell => cell === 2).length === line.length;

        if (filled) {
            for (let x = 0; x < field[rowIdx].length; x++) {
                field[rowIdx][x] = 3;
            }
        }
    }

    return {
        finished,
        stopRow,
        hasToRemove
    };
}

export function removeFilledLines(field) {
    let count = 0;
    for (let rowIdx = 0; rowIdx < 20; rowIdx++) {
        const line = field[rowIdx];
        const filled = line.filter(cell => cell === 3).length === line.length;

        if (filled) {
            for (let x = 0; x < field[rowIdx].length; x++) {
                field[rowIdx][x] = 0;
            }
            count++;

            // move all the rows above down 1 cell
            for (let i = rowIdx + 1; i < 20; i++) {
                for (let j = 0; j < line.length; j++) {
                    if (field[i][j] !== 1) {
                        field[i - 1][j] = field[i][j];
                        field[i][j] = 0;
                    }
                }
            }
            rowIdx--; // step backward
        }
    }

    return count;
}
