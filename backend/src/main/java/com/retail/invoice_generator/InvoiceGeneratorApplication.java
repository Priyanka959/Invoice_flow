package com.retail.invoice_generator;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import me.paulschwarz.springdotenv.DotenvPropertySource;

@SpringBootApplication(scanBasePackages = "com.retail")
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class InvoiceGeneratorApplication {
    public static void main(String[] args) {
        new SpringApplicationBuilder(InvoiceGeneratorApplication.class)
                .initializers(context -> DotenvPropertySource.addToEnvironment(context.getEnvironment()))
                .run(args);
    }
}

