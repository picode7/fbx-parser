export { parseBinary } from './binary'
export { parseText } from './ascii'

// // Test

// import * as path from 'path'
// import * as fs from 'fs'
// import { FBX } from './shared'
// import { parseBinary } from './binary'
// import { parseText } from './ascii'

// async function init() {
//   {
//     const file = 'tests/data/binary.FBX'
//     let fbx: FBX
//     try {
//       // try binary file encoding
//       fbx = parseBinary(await fs.readFileSync(file))
//     } catch (e) {
//       // try text file encoding
//       fbx = parseText(await fs.readFileSync(file, 'utf-8'))
//     }

//     // console.log(fbx)
//     const outFileName = path.join(path.dirname(file), path.basename(file, path.extname(file)) + '.json')
//     fs.writeFileSync(
//       outFileName,
//       JSON.stringify(
//         fbx,
//         (k, v) => {
//           if (typeof v === 'bigint') {
//             if (v < Number.MIN_SAFE_INTEGER || v > Number.MAX_SAFE_INTEGER) return v.toString()
//             return Number(v)
//           }
//           return v
//         },
//         2
//       )
//     )
//   }
//   // {
//   //   const sourceFileName = 'tests/data/binary.fbx'
//   //   let fbx = parse(await fs.readFileSync(sourceFileName, 'ascii'))

//   //   const outFileName = path.join(
//   //     path.dirname(sourceFileName),
//   //     path.basename(sourceFileName, path.extname(sourceFileName)) + '.json'
//   //   )
//   //   fs.writeFileSync(
//   //     outFileName,
//   //     JSON.stringify(
//   //       fbx,
//   //       // (k, v) => {
//   //       //   if (typeof v === 'bigint') {
//   //       //     if (v < Number.MIN_SAFE_INTEGER || v > Number.MAX_SAFE_INTEGER) return v.toString()
//   //       //     return Number(v)
//   //       //   }
//   //       //   return v
//   //       // },,
//   //       (k, v) => {
//   //         if (typeof v === 'bigint') return v.toString()
//   //         return v
//   //       },
//   //       2
//   //     )
//   //   )
//   // }

//   // {
//   //   const sourceFileName = 'tests/data/ascii.fbx'
//   //   let fbx = parse(await fs.readFileSync(sourceFileName, 'utf8'))
//   //   const outFileName = path.join(
//   //     path.dirname(sourceFileName),
//   //     path.basename(sourceFileName, path.extname(sourceFileName)) + '.json'
//   //   )
//   //   fs.writeFileSync(
//   //     outFileName,
//   //     JSON.stringify(
//   //       fbx,
//   //       // (k, v) => {
//   //       //   if (typeof v === 'bigint') {
//   //       //     if (v < Number.MIN_SAFE_INTEGER || v > Number.MAX_SAFE_INTEGER) return v.toString()
//   //       //     return Number(v)
//   //       //   }
//   //       //   return v
//   //       // },,
//   //       (k, v) => {
//   //         if (typeof v === 'bigint') return v.toString()
//   //         return v
//   //       },
//   //       2
//   //     )
//   //   )
//   // }
// }

// init()
