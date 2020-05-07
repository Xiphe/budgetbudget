/* In cypress tests, errors might be created in another window
   so duck-typing is more save then instanceof Error */
export default function isError(input: unknown): input is Error {
  return (
    input &&
    typeof input === 'object' &&
    (input as any).stack &&
    (input as any).message
  );
}
