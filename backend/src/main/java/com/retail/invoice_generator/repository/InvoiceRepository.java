package com.retail.invoice_generator.repository;

import com.retail.invoice_generator.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT i FROM Invoice i LEFT JOIN i.customer c " +
           "WHERE (:customerId IS NULL OR c.id = :customerId) " +
           "AND (:customerName IS NULL OR :customerName = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :customerName, '%'))) " +
           "AND (:createdById IS NULL OR i.createdBy.id = :createdById) " +
           "AND (:fromDate IS NULL OR i.invoiceDate >= :fromDate) " +
           "AND (:toDate IS NULL OR i.invoiceDate <= :toDate)")
    Page<Invoice> findWithFilters(
            @Param("customerId") Long customerId,
            @Param("customerName") String customerName,
            @Param("createdById") Long createdById,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );

    @Query("SELECT MAX(i.invoiceNumber) FROM Invoice i WHERE i.invoiceNumber LIKE :pattern")
    Optional<String> findLastInvoiceNumberInYear(@Param("pattern") String pattern);
}
