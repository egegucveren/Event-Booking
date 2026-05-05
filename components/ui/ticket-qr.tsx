const QR_SIZE = 21;
const DATA_CODEWORDS = 19;
const ECC_CODEWORDS = 7;
const FORMAT_L_MASK_0 = 0b111011111000100;

type Cell = boolean | null;

type TicketQrProps = {
  value: string;
  label: string;
};

function createGfTables() {
  const exp = new Array<number>(512).fill(0);
  const log = new Array<number>(256).fill(0);
  let x = 1;

  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }

  for (let i = 255; i < 512; i++) {
    exp[i] = exp[i - 255];
  }

  return { exp, log };
}

const gf = createGfTables();

function gfMultiply(a: number, b: number) {
  if (a === 0 || b === 0) return 0;
  return gf.exp[gf.log[a] + gf.log[b]];
}

function buildGenerator(degree: number) {
  let poly = [1];

  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMultiply(poly[j], gf.exp[i]);
    }
    poly = next;
  }

  return poly;
}

function reedSolomon(data: number[], degree: number) {
  const generator = buildGenerator(degree);
  const message = [...data, ...new Array<number>(degree).fill(0)];

  for (let i = 0; i < data.length; i++) {
    const factor = message[i];
    if (factor === 0) continue;

    for (let j = 0; j < generator.length; j++) {
      message[i + j] ^= gfMultiply(generator[j], factor);
    }
  }

  return message.slice(data.length);
}

function pushBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i--) {
    bits.push((value >>> i) & 1);
  }
}

function createCodewords(value: string) {
  const bytes = Array.from(Buffer.from(value, "ascii"));
  if (bytes.length > 17) {
    throw new Error("Ticket QR value is too long for the compact QR format.");
  }

  const bits: number[] = [];
  pushBits(bits, 0b0100, 4);
  pushBits(bits, bytes.length, 8);
  bytes.forEach((byte) => pushBits(bits, byte, 8));

  const capacity = DATA_CODEWORDS * 8;
  pushBits(bits, 0, Math.min(4, capacity - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(Number.parseInt(bits.slice(i, i + 8).join(""), 2));
  }

  const pads = [0xec, 0x11];
  for (let i = 0; data.length < DATA_CODEWORDS; i++) {
    data.push(pads[i % 2]);
  }

  return [...data, ...reedSolomon(data, ECC_CODEWORDS)];
}

function createMatrix() {
  const matrix: Cell[][] = Array.from({ length: QR_SIZE }, () => Array<Cell>(QR_SIZE).fill(null));
  const reserved = Array.from({ length: QR_SIZE }, () => Array<boolean>(QR_SIZE).fill(false));

  function set(row: number, col: number, value: boolean, reserve = true) {
    if (row < 0 || col < 0 || row >= QR_SIZE || col >= QR_SIZE) return;
    matrix[row][col] = value;
    if (reserve) reserved[row][col] = true;
  }

  function addFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r;
        const cc = col + c;
        const inFinder = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        set(rr, cc, inFinder && (border || center));
      }
    }
  }

  addFinder(0, 0);
  addFinder(0, QR_SIZE - 7);
  addFinder(QR_SIZE - 7, 0);

  for (let i = 8; i < QR_SIZE - 8; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }

  set(8, QR_SIZE - 8, true);

  for (let i = 0; i <= 5; i++) {
    set(8, i, ((FORMAT_L_MASK_0 >> i) & 1) === 1);
    set(i, 8, ((FORMAT_L_MASK_0 >> i) & 1) === 1);
  }
  set(8, 7, ((FORMAT_L_MASK_0 >> 6) & 1) === 1);
  set(8, 8, ((FORMAT_L_MASK_0 >> 7) & 1) === 1);
  set(7, 8, ((FORMAT_L_MASK_0 >> 8) & 1) === 1);

  for (let i = 9; i < 15; i++) {
    set(14 - i, 8, ((FORMAT_L_MASK_0 >> i) & 1) === 1);
    set(8, QR_SIZE - 15 + i, ((FORMAT_L_MASK_0 >> i) & 1) === 1);
  }

  return { matrix, reserved };
}

function createQrMatrix(value: string) {
  const { matrix, reserved } = createMatrix();
  const bits = createCodewords(value).flatMap((codeword) =>
    Array.from({ length: 8 }, (_, i) => (codeword >> (7 - i)) & 1)
  );
  let bitIndex = 0;
  let upward = true;

  for (let col = QR_SIZE - 1; col > 0; col -= 2) {
    if (col === 6) col--;

    for (let offset = 0; offset < QR_SIZE; offset++) {
      const row = upward ? QR_SIZE - 1 - offset : offset;

      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;
        if (reserved[row][currentCol]) continue;

        const bit = bits[bitIndex++] ?? 0;
        const masked = (bit === 1) !== ((row + currentCol) % 2 === 0);
        matrix[row][currentCol] = masked;
      }
    }

    upward = !upward;
  }

  return matrix;
}

export function TicketQr({ value, label }: TicketQrProps) {
  const matrix = createQrMatrix(value);
  const cells = matrix.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) =>
      cell ? <rect height="1" key={`${rowIndex}-${colIndex}`} width="1" x={colIndex} y={rowIndex} /> : null
    )
  );

  return (
    <figure className="ticket-qr" aria-label={label}>
      <svg role="img" viewBox="-2 -2 25 25" xmlns="http://www.w3.org/2000/svg">
        <title>{label}</title>
        <rect fill="#fff" height="25" width="25" x="-2" y="-2" />
        <g fill="#07111d">{cells}</g>
      </svg>
      <figcaption>{value}</figcaption>
    </figure>
  );
}
