package com.retail.invoice_generator.repository;

import com.retail.invoice_generator.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Page<Customer> findByNameContainingIgnoreCaseOrPhoneContaining(String name, String phone, Pageable pageable);

    Optional<Customer> findByPhone(String phone);

    boolean existsByPhone(String phone);
}

