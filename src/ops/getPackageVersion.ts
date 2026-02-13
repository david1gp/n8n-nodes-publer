import pkg from "../../package.json"

export function getPackageVersion(): string {
  return pkg.version
}
