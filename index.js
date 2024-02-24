const fs = require("fs").promises;

const readTxts = async () => {
  try {
    const dir = "./speds";
    const files = await fs.readdir(dir, "utf8");

    files.forEach(async (path) => {
      const fullPath = `${dir}/${path}`;
      const file = await fs.readFile(fullPath, "utf-8");
      const fileRows = file.split("\n");

      const d0150 = "0150";
      const emptyValue = "";

      const newArr = [];

      console.log(`\nAlterações do Arquivo ${path}:\n`);

      for (let i = 0; i < fileRows.length; i++) {
        const row = fileRows[i];
        const rowArray = row.split("|");

        if (rowArray[1] === d0150) {
          const ibgeCode = rowArray[8].slice(0, 2);
          const ie = rowArray[7];

          console.log({ ibgeCode, ie });

          if (["53", "43", "31", "11"].includes(ibgeCode)) {
            let requiredLength = 0;

            switch (ibgeCode) {
              case "53":
              case "31":
                requiredLength = 13;
                break;
              case "43":
                requiredLength = 10;
                break;
              case "11":
                requiredLength = 14;
                break;
            }

            console.log({ requiredLength });

            if (ie.length !== requiredLength) {
              const leadingZeros = "0".repeat(requiredLength - ie.length);
              rowArray[7] = leadingZeros + ie;
              console.log({ leadingZeros, a: rowArray[7] });
            }
          }
        }

        const updatedRow = rowArray.join("|");

        if (
          rowArray[1] === d0150 &&
          (rowArray[10] === emptyValue ||
            rowArray[11] === emptyValue ||
            rowArray[13] === emptyValue)
        ) {
          if (rowArray[10] === emptyValue) {
            rowArray[10] = "R"; // Linha 10
          }
          if (rowArray[11] === emptyValue) {
            rowArray[11] = "0"; // Linha 11
          }
          if (rowArray[13] === emptyValue) {
            rowArray[13] = "CENTRO"; // Linha 13
          }

          // Recriar a linha com os valores atualizados
          const newRow = rowArray.join("|");
          newArr.push(newRow);

          const oldColor = "\x1b[41m";
          const changedColor = "\x1b[42m";
          const texto = "%s";
          const reset = "\x1b[0m";
          const optionsOld = `${oldColor}${texto}${reset}`;
          const optionsChanged = `${changedColor}${texto}${reset}`;

          console.log(optionsOld, `${i + 1} - ${row}`);
          console.log(optionsChanged, `${i + 1} + ${newRow}`);
          console.log("\n");
        } else if (rowArray[2] === d0150) {
          // Caso a linha já contenha valores, ignorar e passar para a próxima
          newArr.push(updatedRow);
        } else {
          newArr.push(updatedRow);
        }
      }

      const fileUpdate = newArr.join("\n");
      await fs.writeFile(fullPath, fileUpdate);
      console.log(`Arquivo ${path} atualizado com sucesso!\n`);
    });

    console.log("Sistema executado com sucesso!\n");
  } catch (error) {
    console.error("Falha: ", error);
  }
};

readTxts();