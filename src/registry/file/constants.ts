import {DEFAULT_MIME_TYPES} from 'file-selector';

export const DEFAULT_MAX_SIZE: number = 1024 ** 2 * 50; // 50 MiB

/**
 * A subset of the file types supported in Open Forms.
 *
 * This should at least cover the file types defined in the backend in
 * ``src/openforms/config/constants.py``: ``UploadFileType``.
 *
 * file-selector also exposes a "full" list, but that adds bundle size while we don't
 * really do anything with those file types. Validation can still receive an empty
 * file type if there's something uploaded that's not covered by this constant.
 *
 * The subset of mime types is taken from file-selector:
 * https://github.com/react-dropzone/file-selector/blob/5843561956d21ad51916fe25f66dcf4f25a9eb38/src/mime.ts
 *
 * Relevant documentation: https://react-dropzone.js.org/examples/accept#restoring-the-full-mime-type-table
 */
export const SUPPORTED_MIME_TYPES = new Map([
  ...DEFAULT_MIME_TYPES,
  ['heic', 'image/heic'],
  // Open Office & friends
  ['odb', 'application/vnd.oasis.opendocument.database'],
  ['odc', 'application/vnd.oasis.opendocument.chart'],
  ['odf', 'application/vnd.oasis.opendocument.formula'],
  ['odft', 'application/vnd.oasis.opendocument.formula-template'],
  ['odg', 'application/vnd.oasis.opendocument.graphics'],
  ['odi', 'application/vnd.oasis.opendocument.image'],
  ['odm', 'application/vnd.oasis.opendocument.text-master'],
  ['odp', 'application/vnd.oasis.opendocument.presentation'],
  ['ods', 'application/vnd.oasis.opendocument.spreadsheet'],
  ['odt', 'application/vnd.oasis.opendocument.text'],
  ['sda', 'application/vnd.stardivision.draw'],
  ['sdc', 'application/vnd.stardivision.calc'],
  ['sdd', 'application/vnd.stardivision.impress'],
  ['sdw', 'application/vnd.stardivision.writer'],
  ['sgl', 'application/vnd.stardivision.writer-global'],
  ['smf', 'application/vnd.stardivision.math'],
  ['stc', 'application/vnd.sun.xml.calc.template'],
  ['std', 'application/vnd.sun.xml.draw.template'],
  ['sti', 'application/vnd.sun.xml.impress.template'],
  ['stw', 'application/vnd.sun.xml.writer.template'],
  ['sxc', 'application/vnd.sun.xml.calc'],
  ['sxd', 'application/vnd.sun.xml.draw'],
  ['sxg', 'application/vnd.sun.xml.writer.global'],
  ['sxi', 'application/vnd.sun.xml.impress'],
  ['sxm', 'application/vnd.sun.xml.math'],
  ['sxw', 'application/vnd.sun.xml.writer'],
  // Other misc
  ['rar', 'application/x-rar'],
  ['tar', 'application/x-tar'],
  ['msg', 'application/vnd.ms-outlook'],
  ['dwg', 'image/vnd.dwg'],
]);
