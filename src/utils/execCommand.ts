import { exec } from 'child_process'

export function execPromise(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message)
      } else {
        resolve(stdout)
      }
    })
  })
}
