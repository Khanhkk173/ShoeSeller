package com.example.shoestore.repository;

import com.example.shoestore.entity.DeletedProductLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeletedProductLogRepository extends JpaRepository<DeletedProductLog, Integer> {

    List<DeletedProductLog> findAllByOrderByDeletedAtDesc();
}