import { Constructor, Converter } from "./converter";
import { MappingRules } from "./decorators";

/**
 * Generates mapping function which will be called during runtime
 * @param sourceType - source type constructor
 * @param targetType - target type constructor
 * @param mappings - mappings array
 * @param options - additional mapping options
 */
export function generateMappingFunction<IN, OUT>(
    sourceType: Constructor<IN>,
    targetType: Constructor<OUT>,
    mappings: MappingRules[],
    options?: {}
) {
    return (sourceObject: IN) => mapObject(sourceObject, new targetType(), mappings);
}

/**
 * Generated mapping function
 * @param sourceObject - object that contains values
 * @param targetObject - object that will be filled according mapping
 * @param mappings - from => to mapping declaration with meta information
 * @param enableNullCheck - enable null check when source object is null
 */
export function mapObject<IN, OUT>(
    sourceObject: IN,
    targetObject: OUT,
    mappings: MappingRules[],
    enableNullCheck: boolean = true
) {
    if (enableNullCheck && sourceObject == null) {
        return null;
    }

    mappings.forEach(mapping => {
        // Get values
        const targetField = mapping.target;
        const sourceField = mapping.source;
        const defaultValue = mapping.default;
        const fieldValue = sourceObject[sourceField];
        const convert = getOrderedConversion(mapping.expr, mapping.converter);

        // Map object//
        if (!fieldValue && defaultValue) {
            targetObject[targetField] = defaultValue;
        } else if (fieldValue && mapping.isCollection) {
            targetObject[targetField] = convertCollection(fieldValue, convert);
        } else if (fieldValue) {
            targetObject[targetField] = convert(fieldValue);
        }
    });

    return targetObject;
}

/**
 * Describes order of converting.
 * Current realisation is: expr => converter.convert
 * @param expr - expression that will be evaluated
 * @param Converter - converter constructor
 */
function getOrderedConversion(expr: (x: any) => any, converterConstructor: Constructor<Converter<any, any>>) {
    if (converterConstructor && expr) {
        const converter = new converterConstructor();
        return s => converter.convert(expr(s));
    } else if (converterConstructor && !expr) {
        const converter = new converterConstructor();
        return s => converter.convert(s);
    } else if (!Converter && expr) {
        return s => expr(s);
    } else {
        return s => s;
    }
}

/**
 * Converts collection with Array.map function
 * @param collection - collection to convert
 * @param mapper - mapping function
 */
function convertCollection<S, T>(collection: S[], mapper: (s: S) => T): T[] {
    return collection.map(o => mapper(o));
}
