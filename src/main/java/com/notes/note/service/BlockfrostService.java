package com.notes.note.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class BlockfrostService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${blockfrost.baseUrl}")
    private String baseUrl;

    @Value("${blockfrost.projectId}")
    private String projectId;

    public boolean isTxConfirmed(String txHash) {
        if (txHash == null || txHash.isBlank()) return false;
        String url = baseUrl + "/txs/" + txHash;
        HttpHeaders headers = new HttpHeaders();
        headers.set("project_id", projectId);
        try {
            ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            return res.getStatusCode().is2xxSuccessful();
        } catch (HttpClientErrorException.NotFound nf) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}

