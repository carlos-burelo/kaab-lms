'use server'

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
async function findSoffice(): Promise<{
  executable: string
  dir: string
}> {
  try {
    const { stdout } = await execFileAsync('where', ['soffice.exe'])
    const fullPath = stdout.trim().split(/[\r\n]/)[0]
    if (!fullPath || !fs.existsSync(fullPath)) {
      throw new Error("Comando 'where soffice.exe' no encontró un ejecutable válido.")
    }
    const libreOfficeDir = path.dirname(fullPath)
    return {
      executable: fullPath,
      dir: libreOfficeDir
    }
  } catch {
    throw new Error("No se pudo encontrar 'soffice.exe'. Revisa el PATH del sistema.")
  }
}
export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  const tempDir = os.tmpdir()
  const uniqueId = crypto.randomUUID()
  const inputPath = path.resolve(tempDir, `${uniqueId}.docx`)
  const outputPath = path.resolve(tempDir, `${uniqueId}.pdf`)
  const outputDir = path.resolve(tempDir)
  let sofficeExecutable: string
  let libreOfficeDir: string
  try {
    const paths = await findSoffice()
    sofficeExecutable = paths.executable
    libreOfficeDir = paths.dir
    fs.writeFileSync(inputPath, docxBuffer)
    const args = ['--headless', '--invisible', '--convert-to', 'pdf:writer_pdf_Export', '--outdir', outputDir, inputPath]
    const { stdout, stderr } = await execFileAsync(sofficeExecutable, args, {
      cwd: libreOfficeDir
    })
    if (stderr) {
      if (!fs.existsSync(outputPath)) {
        throw new Error(`Error de soffice (stderr): ${stderr}. El archivo de salida no se creó.`)
      } else {
      }
    }
    if (!fs.existsSync(outputPath)) {
      throw new Error(`El archivo PDF de salida no se encontró en: ${outputPath}. stdout: ${stdout}`)
    }
    const pdfBuffer = fs.readFileSync(outputPath)
    fs.unlinkSync(inputPath)
    fs.unlinkSync(outputPath)
    return pdfBuffer
  } catch {
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath)
    }
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath)
    }
    throw new Error('Error al convertir documento a PDF con soffice (execFile)')
  }
}
