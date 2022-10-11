/* eslint-disable prettier/prettier */
import { CreateExaminationDto } from './../dto/create-examination.dto';

export type UpdateExamination = Omit<CreateExaminationDto, 'patientId'>;
