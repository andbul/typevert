export type Constructor<T> = new(...args: any[]) => T;

/**
 * Converter interface
 */
export interface Conversion<IN, OUT> {

    preConvert(source: IN): IN;

    convert(source: IN): OUT;

    postConvert(dest: OUT): OUT;

}

/**
 * Class that must be used as parent for generating mapper
 */
export abstract class Converter<IN, OUT> implements Conversion<IN, OUT> {

    preConvert(source: IN): IN {
        return source == undefined ? null : source;
    }

    convert(source: IN): OUT {
        const preConvertedObj = this.preConvert(source);
        const convertedObj = this.mappingFunction(preConvertedObj);
        return this.postConvert(convertedObj);
    }

    postConvert(dest: OUT): OUT {
        return dest == undefined ? null : dest;
    }

    /**
     * Function that will be replaced by generated one
     * @param source
     */
    protected mappingFunction(source: IN): OUT {
        return undefined
    }

}