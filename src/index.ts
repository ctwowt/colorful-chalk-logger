import program from 'commander'
import { Level } from './level'
import { Logger, Options } from './logger'
export { Level, DEBUG, INFO, VERBOSE, WARN, ERROR, FATAL } from './level'


let registered: boolean = false


export class ColorfulChalkLogger extends Logger {
  constructor(name: string, options?: Options, args?: string[]) {
    super(name, ColorfulChalkLogger.generateOptions(options, args))
  }

  /**
   * parse command line args
   * @param options
   * @param args
   */
  private static generateOptions(options?: Options, args?: string[]): Options {
    if (options == null) options = {} as Options
    if (args == null) return options

    const levelRegex: RegExp = /^--log-level\s*[=\s]\s*(\w+)$/
    const flagRegex: RegExp = /^--log-flag\s*[=\s]\s*(no-)?(date|inline|colorful)$/
    const outputRegex: RegExp = /^--log-output\s*[=\s]\s*((['"])[\s\S]+\2|\S+)$/
    const encodingRegex: RegExp = /^--log-encoding\s*[=\s]\s*([\w\-.]+)$/

    // register into commander
    if (!registered) {
      registered = true
      program
        .option('--log-level <level>', 'specify logger\'s level.')
        .option('--log-flag <option>', 'specify logger\' option. (date,colorful)')
        .option('--log-output <filepath>', 'specify logger\' output path.')
        .option('--log-encoding <encoding>', 'specify output file encoding.')
    }

    args.forEach(arg => {
      if (levelRegex.test(arg)) {
        let [, levelString] = levelRegex.exec(arg) as string[]
        let newLevel = Level.valueOf(levelString)
        if (newLevel == null) return
        if (options!.level == null || newLevel.rank < options!.level!.rank)
          options!.level = newLevel
      }
      if (flagRegex.test(arg)) {
        let [, negative, flag] = flagRegex.exec(arg) as string[]
        options![flag] = !negative
      }
      if (encodingRegex.test(arg)) {
        let [, encoding] = levelRegex.exec(arg) as string[]
        options!.encoding = encoding
      }
      if (outputRegex.test(arg)) {
        let [, filepath] = outputRegex.exec(arg) as string[]
        if (/^['"]([\s\S]+)['"]$/.test(filepath)) filepath = /^['"]([\s\S]+)['"]$/.exec(filepath)![1]
        options!.filepath = filepath
      }
    })

    return options
  }
}