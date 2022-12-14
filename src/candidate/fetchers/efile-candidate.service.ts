import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { EfileElectionService } from 'src/election/fetchers/efile-election.service';

export interface EfileOfficeResults {
  [key: string]: [EfileCandidateResults];
}

export interface EfileCandidateResults {
  full_office_name: string;

  agency: string;
  candidate_name: string;
  coe_id: string;
  district: string;
  election_id: string;
  filer_id: string;
  first_name: string;
  jurisdiction_code: string;
  jurisdiction_id: string;
  jurisdiction_name: string;
  jurisdiction_type: string;
  last_name: string;
  middle_name: string;
  office: string;
  office_code: string;
  office_id: string;
  suffix: string;
  title: string;
}

@Injectable()
export class EfileCandidateService {
  constructor(
    private httpService: HttpService,
    private efileElectionService: EfileElectionService,
  ) {}

  private defaultUrlPrefix = `https://efile.sandiego.gov/api/v1/public`;
  private urlPath = `campaign-search/candidate/list`;

  public async runDownloadCandidates(
    urlPrefix: string = this.defaultUrlPrefix,
    electionDate: string,
  ) {
    const elections = await this.efileElectionService.runDownloadElections(
      urlPrefix,
    );

    const election = elections.find(
      (election) => election.election_date === electionDate,
    );
    if (!election.election_id) return [];

    const url = `${urlPrefix}/${this.urlPath}/${election.election_id}`;

    const offices = await this.downloadOffices(url);

    const candidates: EfileCandidateResults[] = [];
    for (const office in offices) {
      offices[office].forEach((candidate) => {
        // The object name does not already exist as a field in each candidate. This adds it.
        candidate['full_office_name'] = office;
        candidates.push(candidate);
      });
    }

    return candidates;
  }

  private async downloadOffices(url: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get<AxiosResponse<EfileOfficeResults>>(url),
      );

      return response.data.data;
    } catch (error) {
      console.log({
        level: 'error',
        message: 'Get request to eFile API failed',
        type: 'eFile API',
        data: 'candidates',
        url: url,
      });
      throw error;
    }
  }
}
