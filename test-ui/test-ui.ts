import * as FBX from '../src'
import { openTextFile } from './utils/files'

export function init() {
  document.querySelector('#open-button')?.addEventListener('click', () => {
    openTextFile((file, content) => {
      console.log(content)

      const elInput = document.querySelector('#input') as HTMLTextAreaElement
      elInput.value = content

      const elOutput = document.querySelector('#output') as HTMLTextAreaElement
      elOutput.value = JSON.stringify(FBX.parse(content), null, '    ')
    }, 'fbx')
  })
}
