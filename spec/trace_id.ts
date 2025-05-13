import { z } from "zod"
import { expectTypesMatch } from "../lib/utils/expect-types-match"

export type TraceId = string

export const trace_id = z.string()

expectTypesMatch<z.infer<typeof trace_id>, TraceId>(true)
