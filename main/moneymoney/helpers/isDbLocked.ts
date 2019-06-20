export default function isDbLocked(err: any) {
  return err.stderr && err.stderr.includes('Locked database. (-2720)');
}
