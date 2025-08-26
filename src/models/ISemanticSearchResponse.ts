import {IDocument} from "./IDocument";
import {IAnswer} from "./IAnswer";

export interface ISemanticSearchResponse {
    documents: IDocument[];
    answers: IAnswer[];
}
