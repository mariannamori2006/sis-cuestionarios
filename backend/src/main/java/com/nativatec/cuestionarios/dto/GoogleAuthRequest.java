package com.nativatec.cuestionarios.dto;

public class GoogleAuthRequest {
    private String idToken;
    private String rol;

    public GoogleAuthRequest() {
    }

    public GoogleAuthRequest(String idToken, String rol) {
        this.idToken = idToken;
        this.rol = rol;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}
