//The function finds anagrams of the searched word by enumeration
//Principle:
// The word is split into an array. We have a "donor" array with symbols and an "assembly" array where we assemble the word.
// For each symbol, we remove the desired symbol from the donor by a cycle, placing it in the assembly.
// We recurrently dive into a similar process, but the symbol from the donor is placed in the assembly (the donor is shorter, the assembly is fuller)
// As soon as the assembly is assembled and the donor is empty, the dive naturally ends and emerges
// If not only anagrams are needed, but also all variants of words - the assembly is added at any iteration and not only when the donor is empty
// The cycle recurrently dives for each symbol. Here the complexity is O(n!)

// There is an option instead of creating new arrays for each cycle, to rearrange the symbols in the desired one,
// then the "donor" also becomes the "assembly" and an iterator is required - what is the current array index.
// There is a danger - with asynchronous operations or dependencies, a mutation of the source can disrupt the work
// This method is more optimal in terms of memory, but you need to strictly control the data flow


const swp = async (inp) => {
    let res = new Set();

    const prmtd = async (donorArr, current) => {
        if (donorArr.length == 0) {
            res.add(current.join(''));
            return;
        }

        for (let i=0;i<=donorArr.length-1;i++) {
            await prmtd(
                [...donorArr.slice(0, i), ...donorArr.slice(i+1) ], 
                [...current, donorArr[i]]
            );
        }
    }
    await prmtd(inp.split(''), []);
    return Array.from(res);
}
swp("qwertyuiop");


const swp2 = async (inp) => {
    let res = new Set();

    const prmtd = async (donorArr, indx) => {
        if (donorArr.length === indx) {
            res.add(donorArr.join(''));
            return;
        }

        for (let i=indx;i<=donorArr.length-1;i++) {
            [donorArr[indx], donorArr[i]] = [donorArr[i], donorArr[indx]];
            await prmtd(donorArr, indx+1);
            [donorArr[indx], donorArr[i]] = [donorArr[i], donorArr[indx]];
        }
    }
    await prmtd(inp.split(''), 0);
    return Array.from(res);
}
swp2("qwertyuiop");



