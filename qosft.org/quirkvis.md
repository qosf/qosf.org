This is a contribution for the bounty of qosf.org on unitaryDESIGN 2026
# Quantum QuirkVis 🙃

A python package that draws quantum circuits written in qasm/OpenQASM 3.0 and outputs as SVG with a strong focus on personalization.

## Features
- SVG output
- Theming engine (JSON)
- Personalization (night mode, custom colors)
- Gate symbol substitutions (emojis, icons, animations)
- Awesome "dial" for parametrized gates
- Animations and other CSS filters
- Lightweight

# Themes
### Default
<img width="1055" height="260" alt="image" src="https://github.com/user-attachments/assets/5dac50ef-7e81-4b44-a892-b462f2ce9228" />
### Night
<img width="1055" height="260" alt="image" src="https://github.com/user-attachments/assets/9100fd8e-13a4-4d17-aa8e-ac3ed5b3fdd2" />
### Matrix
<img width="1055" height="260" alt="image" src="https://github.com/user-attachments/assets/c0d4c209-fe49-4432-bb69-458eaebb6484" />
### Emoji
<img width="1055" height="260" alt="image" src="https://github.com/user-attachments/assets/bffd7bcf-5dfd-4554-ac69-0bfffc0473ee" />


## Installation
```bash
pip install quirkvis

#or

pip install git+https://github.com/ljcamargo/quantum_quirkvis.git
```

## Usage
```python
from quantum_quirkvis import draw

qasm_str = """
OPENQASM 3.0;
qubit[2] q;
h q[0];
cx q[0], q[1];
"""

draw(qasm_str, theme="matrix", filename="path/to/file.svg")

# or

svg = draw(qasm_str, theme="matrix")
```

## Themes and Customization
### Creating full custom themes

The easiest way is to create a copy of [default.json](https://github.com/ljcamargo/quantum_quirkvis/blob/master/src/quantum_quirkvis/themes/default.json) and make the desired changes, then in python:

```python
from quantum_quirkvis import draw
draw(qasm, theme="mytheme.json", filename="output.svg")
```

or run directly from the console like this
```sh
qasmvis ghz.qasm -t mytheme.json -o ghz.svg
```

### Doing subtle customizations
You don't need to copy edit entire file if you only wish a subtle change, for example, if you would rather use the classic square for the gates and keep the rest of the theme intact you just:

squared_gates.json
```json
{
  "name":"squared_gates",
  "shapes":{
    "gate":{
      "type":"rect",
      "width":40,
      "height":40
    }
  }
}
```

the rest of the values gets defaulted to the default.json theme. The only limitation for now is that you cannot choose the parent theme, for example, if you would like to extend or edit the matrix theme, you would need to copy the full matrix.json file from source.

## Libraries
The current package just requires pyqasm to parse the qasm files or string into the AST that is processed to create SVG with the selected theme.

## License
MIT

## Limitations
Currently the library "unrolls" the circuit, therefore complex or custom gates (like CY, Toffoli, CSWAP, etc) are drawn as their primitives.

U-n gates are not yet supported

## unitaryDESIGN
This repo is currently running for a bounty on [unitaryDESIGN](unitary.design) hackathon
