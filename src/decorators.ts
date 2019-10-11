import { Constructor, Conversion, Converter } from "./converter";
import { generateMappingFunction } from "./mapping";

/**
 * Mapping rules that will be used during mapping.
 *
 * source - name of the source object field
 * source - name of the target object field
 * default - set default value if field is null
 * expr - helps to pre evaluate field value
 * isCollection - transform field value with Array.map
 * converter - convert field value with converter
 *
 * Mapping has the next order:
 *  - Setup default in field if null
 *  - Evaluate expr
 *  - Evaluate converter
 *
 *  If isCollection is true then for each value in collection will be performed:
 *  - Evaluate expr
 *  - Evaluate converter
 */
export interface MappingRules {
    source: string;
    target: string;
    default?: any;
    expr?: (x: any) => any;
    isCollection?: boolean;
    converter?: Constructor<Converter<any, any>>;
    // converter?: Converter<any, any>
}

/**
 * Declaration that describes mapper with:
 *
 * name - name of the mapper
 * sourceType - constructor
 * targetType - will be used for creating new target object
 *
 */
export interface MapperDeclaration<IN, OUT> {
    name?: string;
    sourceType: Constructor<IN>;
    targetType: Constructor<OUT>;
}

/**
 * Mapper API. Decorator that used for describing mapper
 * @param mapperDeclaration - declaration
 * @param mappings - mappings
 * @constructor - generated mapper
 */
export function Mapper<IN, OUT>(mapperDeclaration: MapperDeclaration<IN, OUT>, mappings?: MappingRules[]) {
    return <T extends Constructor<Conversion<IN, OUT>>>(constructor: T) => {
        return class extends constructor {
            public mappings = mappings;
            public mappingFunction = generateMappingFunction(
                mapperDeclaration.sourceType,
                mapperDeclaration.targetType,
                mappings
            );
        };
    };
}
