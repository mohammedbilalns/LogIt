//  color codes
const colors = {
  reset: '\x1b[0m',
  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

type LogFunction = (label: string, message: string) => void;

interface Logger {
  red: LogFunction;
  green: LogFunction;
  yellow: LogFunction;
  blue: LogFunction;
  magenta: LogFunction;
  cyan: LogFunction;
  white: LogFunction;
}

const createColorLogger = (color: keyof typeof colors, bgColor: keyof typeof colors) => {
  return (label: string, message: string) => {
    console.log(
      `${colors[bgColor]}${colors.black}${label}${colors.reset} : ${colors[color]}${message}${colors.reset}`
    );
  };
};

export const logger: Logger = {
  red: createColorLogger('red', 'bgRed'),
  green: createColorLogger('green', 'bgGreen'),
  yellow: createColorLogger('yellow', 'bgYellow'),
  blue: createColorLogger('blue', 'bgBlue'),
  magenta: createColorLogger('magenta', 'bgMagenta'),
  cyan: createColorLogger('cyan', 'bgCyan'),
  white: createColorLogger('white', 'bgWhite')
}; 