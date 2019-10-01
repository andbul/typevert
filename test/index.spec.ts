import { suit as PrimitiveSuit } from "./suits/primitives.test"
import { suit as CollectionSuit } from "./suits/collection.test"
import { suit as OrderSuit } from "./suits/mappingorder.test"
import {expect} from "chai"
import {describe, should} from 'mocha'

describe('Typevert', () => {

    describe('Primitives', PrimitiveSuit.bind(this))
    describe('Collections', CollectionSuit.bind(this))
    describe('Ordering', OrderSuit.bind(this))

})
