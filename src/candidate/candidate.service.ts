import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SourceService } from 'src/source/source.service';
import { EfileCandidateService } from './fetchers/efile-candidate.service';

interface CandidateInput {
  electionDate: string;
  source: string;
  url: string;
}

export interface CandidateOutput {
  fullOfficeName: string;

  agency: string;
  candidateName: string;
  coeId: string;
  district: string;
  electionId: string;
  filerId: string;
  firstName: string;
  jurisdictionCode: string;
  jurisdictionId: string;
  jurisdictionName: string;
  jurisdictionType: string;
  lastName: string;
  middleName: string;
  office: string;
  officeCode: string;
  officeId: string;
  suffix: string;
  title: string;
}

@Injectable()
export class CandidateService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private sourceService: SourceService,
    private efileCandidateService: EfileCandidateService,
  ) {}

  public async getCandidates(
    input: CandidateInput,
  ): Promise<CandidateOutput[]> {
    const { source, url, electionDate } = input;

    if (!(await this.sourceService.isSourceValid(source))) return [];

    if (source === 'EFILE') {
      const results = await this.efileCandidateService.runDownloadCandidates(
        url,
        electionDate,
      );

      return results.map((candidate) => ({
        fullOfficeName: candidate.full_office_name,
        agency: candidate.agency,
        candidateName: candidate.candidate_name,
        coeId: candidate.coe_id,
        district: candidate.district,
        electionId: candidate.election_id,
        filerId: candidate.filer_id,
        firstName: candidate.first_name,
        jurisdictionCode: candidate.jurisdiction_code,
        jurisdictionId: candidate.jurisdiction_id,
        jurisdictionName: candidate.jurisdiction_name,
        jurisdictionType: candidate.jurisdiction_type,
        lastName: candidate.last_name,
        middleName: candidate.middle_name,
        office: candidate.office,
        officeCode: candidate.office_code,
        officeId: candidate.office_id,
        suffix: candidate.suffix,
        title: candidate.title,
      }));
    } else if (source === 'NETFILE') {
    } else if (source === 'CAMPAIGNDOCS') {
    }

    return [];
  }
}
