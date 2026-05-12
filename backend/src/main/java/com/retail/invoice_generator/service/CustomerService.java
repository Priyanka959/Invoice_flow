package com.retail.invoice_generator.service;

import com.retail.invoice_generator.dto.request.CreateCustomerRequest;
import com.retail.invoice_generator.dto.request.UpdateCustomerRequest;
import com.retail.invoice_generator.dto.response.CustomerResponse;
import com.retail.invoice_generator.exception.BusinessException;
import com.retail.invoice_generator.exception.ResourceNotFoundException;
import com.retail.invoice_generator.model.Customer;
import com.retail.invoice_generator.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("Phone already registered");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        return mapToResponse(savedCustomer);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        if (request.getPhone() != null && !request.getPhone().equals(customer.getPhone())) {
            if (customerRepository.existsByPhone(request.getPhone())) {
                throw new BusinessException("Phone already registered by another customer");
            }
            customer.setPhone(request.getPhone());
        }

        if (request.getName() != null) {
            customer.setName(request.getName());
        }
        if (request.getEmail() != null) {
            customer.setEmail(request.getEmail());
        }
        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress());
        }

        Customer updatedCustomer = customerRepository.save(customer);
        return mapToResponse(updatedCustomer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        return customerRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> searchCustomers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        String searchTerm = query == null ? "" : query;
        
        return customerRepository.findByNameContainingIgnoreCaseOrPhoneContaining(searchTerm, searchTerm, pageable)
                .map(this::mapToResponse);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .createdAt(customer.getCreatedAt())
                .build();
    }
}

