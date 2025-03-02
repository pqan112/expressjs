import argv from 'minimist'
import { ENVIRONMENTS } from './envs'

const options = argv(process.argv.slice(2))
export const isProduction = options.env === ENVIRONMENTS.PRODUCTION
